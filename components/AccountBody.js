import Router from 'next/router';

export default ({ logout }) => (
  <>
    <p>This is the account page</p>
    <button onClick={async () => {
      const result = await logout();
      console.log('LOGOUT RESULT FROM ACCOUNTBODY ', result);
      Router.replace('/login');
    }}>Logout</button>
  </>
);