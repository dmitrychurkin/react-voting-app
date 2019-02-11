import Router from 'next/router';
import Layout from '../components/Layout';
import AccounContainer from '../containers/AccountCountainer';

const Account = () => (
  <Layout>
    <AccounContainer />
  </Layout>
);

Account.getInitialProps = async ({ isServer, store }) => {

  if (!isServer && !store.getState().app.userLogged) {
    return Router.replace({ pathname: '/login', query: { r: encodeURIComponent(window.location.href) } });
  }

};

export default Account;