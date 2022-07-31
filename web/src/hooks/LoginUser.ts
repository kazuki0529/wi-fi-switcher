import { Auth } from 'aws-amplify';
import { useState, useEffect } from 'react';


/**
 * ログインしているユーザーの情報を扱うcustom hook
 */
export function useLogonUser() {
  const [isLogon, setIsLogon] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<any | undefined>(undefined);

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(() => {
        Auth.currentUserInfo()
          .then(info => {
            setIsLogon(true);
            setUserInfo(info);
          });
      });
  }, []);


  return {
    isLogon, //ログインしているかどうか(未判定の場合もfalse)
    userInfo, //ユーザー情報
  };
}