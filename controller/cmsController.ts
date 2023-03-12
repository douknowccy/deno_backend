// id,圖片地址,影片地址,字符串文案

import { Status, StatusMsg } from "../utils/httpStatus.ts";
import { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { getCmsData } from "../services/cmsService.ts";

// 上傳圖片/影片資源
export const postCmsResources = async () => {};
// 獲取圖片/影片資源

export const getCmsResources = async (ctx: Context) => {
  const queryParams = ctx.request.url.searchParams;
  const cmsId = queryParams.get("cmsId");
  console.log({ cmsId });
  if (!cmsId) {
    ctx.response.status = Status.NotAcceptable;
    ctx.response.body = {
      message: StatusMsg[Status.NotAcceptable],
      successful: false,
    };
    return;
  }
  const data = await getCmsData(cmsId);
};

// 修改圖片/影片資源

export const editCmsResources = async () => {};

// 刪除圖片/影片資源

export const deleteCmsResources = async () => {};
