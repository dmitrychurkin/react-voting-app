import axios from 'axios';
import Router from 'next/router';
import Layout from '../components/Layout';

const Account = props => (
  <Layout>
    <p>This is the account page</p>
  </Layout>
);

Account.getInitialProps = async ({ isServer }) => {

  if (!isServer) {
    const { auth } = await axios.get(`/api/auth?_=${Math.round(Date.now()*Math.random())}`);
    console.log('Account.getInitialProps auth ', auth);
    if (auth) {
      // TODO: handle some specific to authed user action
      return;
    }
    return Router.replace({ pathname: '/login', query: { r: encodeURIComponent(window.location.href) } });
  }

};

export default Account;