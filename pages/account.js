import Router from 'next/router';
import Layout from '../components/Layout';

const Account = props => (
  <Layout>
    <p>This is the account page</p>
  </Layout>
);

Account.getInitialProps = async ({ isServer, store }) => {

  if (!isServer && !store.getState().app.userLogged) {
    return Router.replace({ pathname: '/login', query: { r: encodeURIComponent(window.location.href) } });
  }

};

export default Account;