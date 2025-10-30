#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PDF转Markdown脚本
使用MinerU API将PDF文件转换为Markdown格式
"""

import os
import requests
import json
import time
from pathlib import Path
import argparse

class PDFToMarkdownConverter:
    def __init__(self, api_key):
        """
        初始化转换器
        
        Args:
            api_key (str): MinerU API密钥
        """
        self.api_key = api_key
        self.api_base_url = 'https://mineru.net/api/v4'
        self.download_folder = 'download'
        self.output_folder = 'output'
        
        # 确保输出文件夹存在
        Path(self.output_folder).mkdir(exist_ok=True)
        
        # 设置请求头
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'Accept': '*/*'
        }
    
    def get_upload_urls(self, file_names):
        """
        获取文件上传链接
        
        Args:
            file_names (list): 文件名列表
            
        Returns:
            tuple: (batch_id, upload_urls)
        """
        try:
            data = {
                "enable_formula": True,
                "language": "ch",
                "enable_table": True,
                "files": [{"name": name, "is_ocr": True} for name in file_names]
            }
            
            print(f"正在获取上传链接...")
            response = requests.post(f'{self.api_base_url}/file-urls/batch', 
                                   headers=self.headers, json=data)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('code') == 0:
                    batch_id = result['data']['batch_id']
                    upload_urls = result['data']['file_urls']
                    print(f"获取上传链接成功，批次ID: {batch_id}")
                    return batch_id, upload_urls
                else:
                    print(f"获取上传链接失败: {result.get('msg', '未知错误')}")
                    return None, None
            else:
                print(f"获取上传链接失败，状态码: {response.status_code}")
                print(f"错误信息: {response.text}")
                return None, None
                
        except Exception as e:
            print(f"获取上传链接时发生错误: {str(e)}")
            return None, None
    
    def upload_files(self, file_paths, upload_urls):
        """
        上传文件到获取的链接
        
        Args:
            file_paths (list): 文件路径列表
            upload_urls (list): 上传链接列表
            
        Returns:
            bool: 上传是否成功
        """
        try:
            for file_path, upload_url in zip(file_paths, upload_urls):
                print(f"正在上传文件: {os.path.basename(file_path)}")
                
                with open(file_path, 'rb') as f:
                    response = requests.put(upload_url, data=f)
                    
                if response.status_code != 200:
                    print(f"文件上传失败: {file_path}")
                    return False
                    
            print("所有文件上传成功")
            return True
            
        except Exception as e:
            print(f"上传文件时发生错误: {str(e)}")
            return False
    
    
    def check_task_status(self, batch_id):
        """
        检查任务状态
        
        Args:
            batch_id (str): 批次ID
            
        Returns:
            list: 任务结果列表
        """
        try:
            while True:
                print("检查任务状态...")
                response = requests.get(f'{self.api_base_url}/extract-results/batch/{batch_id}', 
                                      headers=self.headers)
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get('code') == 0:
                        tasks = result['data']['extract_result']
                        all_done = True
                        
                        for task in tasks:
                            state = task['state']
                            if state == 'done':
                                continue
                            elif state == 'failed':
                                print(f"任务失败: {task.get('err_msg', '未知错误')}")
                                return None
                            else:
                                all_done = False
                                print(f"任务状态: {state}")
                                break
                        
                        if all_done:
                            print("所有任务完成")
                            return tasks
                    else:
                        print(f"查询任务状态失败: {result.get('msg', '未知错误')}")
                        return None
                else:
                    print(f"查询任务状态失败，状态码: {response.status_code}")
                    return None
                    
                time.sleep(5)  # 等待5秒后再次检查
                
        except Exception as e:
            print(f"检查任务状态时发生错误: {str(e)}")
            return None
    
    def download_results(self, tasks):
        """
        下载并保存结果，自动解压并提取Markdown文件
        
        Args:
            tasks (list): 任务结果列表
            
        Returns:
            bool: 下载是否成功
        """
        try:
            import zipfile
            import shutil
            
            success_count = 0
            for task in tasks:
                file_name = task['file_name']
                result_url = task['full_zip_url']
                
                print(f"正在下载结果: {file_name}")
                response = requests.get(result_url)
                
                if response.status_code == 200:
                    # 创建临时zip文件
                    temp_zip_path = os.path.join(self.output_folder, f"temp_{os.path.splitext(file_name)[0]}.zip")
                    with open(temp_zip_path, 'wb') as f:
                        f.write(response.content)
                    
                    # 解压ZIP文件
                    extract_folder = os.path.join(self.output_folder, f"{os.path.splitext(file_name)[0]}_extracted")
                    with zipfile.ZipFile(temp_zip_path, 'r') as zip_ref:
                        zip_ref.extractall(extract_folder)
                    
                    # 查找并复制Markdown文件
                    markdown_file = None
                    for root, dirs, files in os.walk(extract_folder):
                        for file in files:
                            if file == 'full.md':
                                markdown_file = os.path.join(root, file)
                                break
                        if markdown_file:
                            break
                    
                    if markdown_file:
                        # 获取基础文件名（不含扩展名）
                        base_name = os.path.splitext(file_name)[0]
                        
                        # 重命名并复制所有重要文件
                        files_to_copy = []
                        
                        # 1. Markdown文件
                        final_md_path = os.path.join(self.output_folder, f"{base_name}.md")
                        shutil.copy2(markdown_file, final_md_path)
                        files_to_copy.append(f"{base_name}.md")
                        
                        # 2. 查找并重命名content_list.json
                        for root, dirs, files in os.walk(extract_folder):
                            for file in files:
                                if file.endswith('_content_list.json'):
                                    content_json_path = os.path.join(root, file)
                                    final_content_path = os.path.join(self.output_folder, f"{base_name}_content.json")
                                    shutil.copy2(content_json_path, final_content_path)
                                    files_to_copy.append(f"{base_name}_content.json")
                                    break
                        
                        # 3. 查找并重命名layout.json
                        layout_json_path = os.path.join(extract_folder, 'layout.json')
                        if os.path.exists(layout_json_path):
                            final_layout_path = os.path.join(self.output_folder, f"{base_name}_layout.json")
                            shutil.copy2(layout_json_path, final_layout_path)
                            files_to_copy.append(f"{base_name}_layout.json")
                        
                        print(f"✅ 文件已保存:")
                        for file in files_to_copy:
                            print(f"   📄 {file}")
                        
                        # 显示文件大小对比
                        original_size = os.path.getsize(os.path.join(self.download_folder, file_name))
                        md_size = os.path.getsize(final_md_path)
                        print(f"📊 文件大小对比: PDF({original_size/1024/1024:.1f}MB) → MD({md_size/1024:.1f}KB)")
                        
                        # 清理临时文件
                        os.remove(temp_zip_path)
                        shutil.rmtree(extract_folder)
                        
                        success_count += 1
                    else:
                        print(f"未找到Markdown文件: {file_name}")
                        # 保留ZIP文件作为备选
                        final_zip_path = os.path.join(self.output_folder, f"{os.path.splitext(file_name)[0]}.zip")
                        shutil.move(temp_zip_path, final_zip_path)
                        print(f"ZIP文件已保存到: {final_zip_path}")
                else:
                    print(f"下载结果失败: {file_name}")
            
            print(f"成功处理 {success_count}/{len(tasks)} 个文件")
            return success_count > 0
            
        except Exception as e:
            print(f"处理结果时发生错误: {str(e)}")
            return False
    
    def batch_convert(self):
        """
        批量转换download文件夹中的所有PDF文件
        """
        if not os.path.exists(self.download_folder):
            print(f"下载文件夹 '{self.download_folder}' 不存在")
            return
        
        pdf_files = [f for f in os.listdir(self.download_folder) if f.lower().endswith('.pdf')]
        
        if not pdf_files:
            print(f"在 '{self.download_folder}' 文件夹中未找到PDF文件")
            return
        
        print(f"找到 {len(pdf_files)} 个PDF文件")
        
        try:
            # 1. 获取上传链接
            batch_id, upload_urls = self.get_upload_urls(pdf_files)
            if not batch_id or not upload_urls:
                print("获取上传链接失败")
                return
            
            # 2. 准备文件路径
            file_paths = [os.path.join(self.download_folder, f) for f in pdf_files]
            
            # 3. 上传文件
            if not self.upload_files(file_paths, upload_urls):
                print("文件上传失败")
                return
            
            # 4. 检查任务状态
            tasks = self.check_task_status(batch_id)
            if not tasks:
                print("任务处理失败")
                return
            
            # 5. 下载结果
            if self.download_results(tasks):
                print(f"\n批量转换完成！成功转换 {len(tasks)} 个文件")
            else:
                print("下载结果失败")
                
        except Exception as e:
            print(f"批量转换过程中发生错误: {str(e)}")

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="PDF→Markdown（MinerU）转换器")
    parser.add_argument("--api-key", type=str, help="MinerU API密钥（或使用环境变量MINERU_API_KEY）")
    parser.add_argument("--file", type=str, help="待转换的PDF文件路径")
    parser.add_argument("--output", type=str, default="output", help="输出目录")
    parser.add_argument("--batch", action="store_true", help="批量转换 output/download 或当前download目录中的所有PDF")
    args = parser.parse_args()

    api_key = args.api_key or os.getenv("MINERU_API_KEY")
    if not api_key:
      raise RuntimeError("未提供API密钥。请通过 --api-key 或设置环境变量 MINERU_API_KEY。")

    converter = PDFToMarkdownConverter(api_key)

    # 设置输出目录
    converter.output_folder = args.output
    Path(converter.output_folder).mkdir(exist_ok=True)

    if args.file:
      # 单文件转换逻辑
      import shutil
      base_name = os.path.basename(args.file)
      # 准备一个临时download目录，用于大小统计
      tmp_download = os.path.join(converter.output_folder, "download_tmp")
      Path(tmp_download).mkdir(exist_ok=True)
      copied_path = os.path.join(tmp_download, base_name)
      shutil.copy2(args.file, copied_path)

      # 将下载目录指向临时目录，便于统计原始大小
      converter.download_folder = tmp_download

      batch_id, upload_urls = converter.get_upload_urls([base_name])
      if not batch_id or not upload_urls:
        raise RuntimeError("获取上传链接失败")

      ok = converter.upload_files([copied_path], upload_urls)
      if not ok:
        raise RuntimeError("文件上传失败")

      tasks = converter.check_task_status(batch_id)
      if not tasks:
        raise RuntimeError("任务处理失败")

      success = converter.download_results(tasks)
      if not success:
        raise RuntimeError("下载结果失败")

      # 输出机器可读的结果路径
      name_wo_ext = os.path.splitext(base_name)[0]
      md_path = os.path.join(converter.output_folder, f"{name_wo_ext}.md")
      content_path = os.path.join(converter.output_folder, f"{name_wo_ext}_content.json")
      layout_path = os.path.join(converter.output_folder, f"{name_wo_ext}_layout.json")

      print(f"##OUTPUT_MD##{md_path}")
      if os.path.exists(content_path):
        print(f"##OUTPUT_CONTENT_JSON##{content_path}")
      if os.path.exists(layout_path):
        print(f"##OUTPUT_LAYOUT_JSON##{layout_path}")
    else:
      # 批量转换模式：沿用原有 batch_convert 行为
      converter.batch_convert()

if __name__ == "__main__":
  main()
