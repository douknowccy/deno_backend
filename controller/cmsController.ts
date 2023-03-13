// id,圖片地址,影片地址,字符串文案

import { Status, StatusMsg } from "../utils/httpStatus.ts";
import { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import {
  CMSDATA_TYPE,
  createCmsData,
  getCmsData,
} from "../services/cmsService.ts";
const errorResponse = (ctx: Context) => {
  ctx.response.status = Status.NotAcceptable;
  ctx.response.body = {
    msg: StatusMsg[Status.NotAcceptable],
    successful: false,
  };
};
const isCmsDataValid = ({
  content,
  json,
  resourceList,
  text,
  tip,
  title,
  cmsId,
}: CMSDATA_TYPE) => {
  if (typeof cmsId !== "string") return false;
  if (typeof title !== "string") return false;
  if (typeof content !== "string") return false;
  if (typeof text !== "string") return false;
  if (typeof tip !== "string") return false;
  if (typeof json !== "string") return false;
  if (typeof resourceList !== "string") return false;
  return true;
};
// 上傳圖片/影片資源
export const postCmsResources = async (ctx: Context) => {
  const bodyValue = await ctx.request.body().value;
  if (!isCmsDataValid(bodyValue)) {
    errorResponse(ctx);
    return;
  }
  const { content, json, resourceList, text, tip, title, cmsId } = bodyValue;

  const data = await createCmsData({
    content,
    json,
    resourceList,
    text,
    tip,
    title,
    cmsId,
  });
  if (data.error) {
    ctx.response.status = Status.NotAcceptable;
    ctx.response.body = {
      message:data.error,
      successful: true,
    };
    return;
  }
  ctx.response.body = {
    message: "",
    successful: true,
  };
};
// 獲取圖片/影片資源

export const getCmsResources = async (ctx: Context) => {
  const queryParams = ctx.request.url.searchParams;
  const cmsId = queryParams.get("cmsId");
  if (!cmsId) {
    ctx.response.status = Status.NotAcceptable;
    ctx.response.body = {
      message: StatusMsg[Status.NotAcceptable],
      successful: false,
    };
    return;
  }
  const data = await getCmsData(cmsId);

  ctx.response.body = {
    message: "",
    data,
    successful: true,
  };
};

// 修改圖片/影片資源

export const editCmsResources = async () => {};

// 刪除圖片/影片資源

export const deleteCmsResources = async () => {};
