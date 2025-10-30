import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface WechatSession {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class WechatService {
  private readonly logger = new Logger(WechatService.name);
  private readonly appId: string;
  private readonly appSecret: string;

  constructor(private configService: ConfigService) {
    this.appId = this.configService.get<string>('wechat.appId') || '';
    this.appSecret = this.configService.get<string>('wechat.appSecret') || '';
  }

  /**
   * 使用微信登录凭证 code 换取 session_key 和 openid
   */
  async code2Session(code: string): Promise<WechatSession> {
    const url = 'https://api.weixin.qq.com/sns/jscode2session';

    try {
      const response = await axios.get<WechatSession>(url, {
        params: {
          appid: this.appId,
          secret: this.appSecret,
          js_code: code,
          grant_type: 'authorization_code',
        },
      });

      const { data } = response;

      if (data.errcode) {
        this.logger.error(`微信登录失败: ${data.errmsg}`, data);
        throw new BadRequestException(`微信登录失败: ${data.errmsg}`);
      }

      if (!data.openid) {
        throw new BadRequestException('无法获取微信用户信息');
      }

      this.logger.log(`微信登录成功: openid=${data.openid}`);

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error('调用微信 API 失败', error.response?.data || error.message);
        throw new BadRequestException('调用微信 API 失败，请稍后重试');
      }
      throw error;
    }
  }

  /**
   * 获取微信访问令牌（用于其他微信 API 调用）
   */
  async getAccessToken(): Promise<string> {
    const url = 'https://api.weixin.qq.com/cgi-bin/token';

    try {
      const response = await axios.get(url, {
        params: {
          grant_type: 'client_credential',
          appid: this.appId,
          secret: this.appSecret,
        },
      });

      const { access_token, errcode, errmsg } = response.data;

      if (errcode) {
        this.logger.error(`获取微信 Access Token 失败: ${errmsg}`);
        throw new BadRequestException(`获取微信 Access Token 失败: ${errmsg}`);
      }

      return access_token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error('获取微信 Access Token 失败', error.response?.data || error.message);
        throw new BadRequestException('获取微信 Access Token 失败');
      }
      throw error;
    }
  }
}
