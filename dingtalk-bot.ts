import axios, { AxiosRequestHeaders, AxiosResponse } from "axios";
import crypto from "crypto";

interface DingtalkResponse {
  errcode: number;
  errmsg: string;
}
class DingTalkBot {
  private headers: AxiosRequestHeaders;
  constructor() {
    this.headers = {
      "Content-Type": "application/json",
    };
  }

  private signSecret(secret: string, content: string) {
    const str = crypto
      .createHmac("sha256", secret)
      .update(content)
      .digest()
      .toString("base64");
    return encodeURIComponent(str);
  }

  async sendText(text: string) {
    const timestamp = new Date().getTime();
    const secret = process.env.secret;
    const sign = this.signSecret(secret, `${timestamp}\n${secret}`);
    const url = `https://oapi.dingtalk.com/robot/send?access_token=${process.env.accessToken}&sign=${sign}&timestamp=${timestamp}`;
    const result: AxiosResponse<DingtalkResponse> = await axios.post(
      url,
      JSON.stringify({ msgtype: "text", text: { content: text } }),
      {
        headers: this.headers,
      }
    );
    if (result.data.errcode !== 0) {
      console.log(result.data);
      throw new Error("send text failed");
    }
  }
}

export default new DingTalkBot();
