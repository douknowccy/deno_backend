
import pool from "../db/postgres.ts";
const createCmsTableFromPostgres = async () => {
  const client = await pool.connect();
  const transaction = client.createTransaction("cms_data_db");
  await transaction.begin();

    await transaction.queryObject`CREATE TABLE IF NOT EXISTS cmsdata (
          cmsId TEXT PRIMARY KEY,
          resourceList TEXT,
          title TEXT,
          content TEXT,
          tip TEXT,
          text TEXT,
          json TEXT
      );`;
//   await transaction.queryObject`ALTER TABLE cmsdata ADD COLUMN cmsId TEXT;`;
  await transaction.commit();
};

export interface CMSDATA_TYPE {
  resourceList: string;
  title: string;
  content: string;
  tip: string;
  text: string;
  json: string;
  cmsId: string;
}

export const getCmsData = async (cmsId: string) => {
  const client = await pool.connect();
  const { rows } = await await client.queryObject<{
    account?: string;
    password?: string;
  }>`SELECT * FROM cmsdata WHERE cmsId = ${cmsId}`;

  client.end();
  return rows;
};

export const createCmsData = async (cmsData: CMSDATA_TYPE) => {
  const {
    content ,
    json ,
    resourceList ,
    text ,
    tip ,
    title ,
    cmsId ,
  } = cmsData;
  const returnParams = {
    error: "",
  };
  await createCmsTableFromPostgres()
  const client = await pool.connect();
  const transaction = client.createTransaction("createCmsData");
  await transaction.begin();
  const { rows } = await transaction.queryObject<{cmsid:string}>`SELECT cmsId FROM cmsdata WHERE cmsId = ${cmsId}`;
  if (rows.length > 0) {
    const cmsId = rows[0].cmsid;
    returnParams.error = `cmsId:${cmsId}已存在`;
    await transaction.commit();
    return returnParams;
  }
  await transaction.queryObject`INSERT INTO cmsdata (cmsId, title, tip, text, content, json, resourceList)
  SELECT ${cmsId}, ${title}, ${tip}, ${text}, ${content}, ${json}, ${resourceList}`;
  await transaction.commit();
  return returnParams
};
