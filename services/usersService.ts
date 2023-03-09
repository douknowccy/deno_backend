import pool from "../db/postgres.ts";

export const registerUser = async (account: string, password: string) => {
  const client = await pool.connect();
  const transaction = client.createTransaction("my_transaction_name");

  await transaction.begin();
  const { rows: userList } = await transaction.queryObject<{
    account: string;
  }>`SELECT account FROM users WHERE account = ${account}`;
  if (userList.length > 0) {
    const account = userList[0].account;
    return {
      msg: `account:${account} is already existed`,
    };
  }

  const registration_date = new Date();
  await transaction.queryArray`INSERT INTO users 
     (account, password,registration_date) VALUES (${account}, ${password},${registration_date})`;

  await transaction.commit();

};
