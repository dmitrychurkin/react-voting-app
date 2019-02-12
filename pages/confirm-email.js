import Link from 'next/link';
import Error from 'next/error'
import Button from '@material-ui/core/Button';
import Router from 'next/router';
import { resendEmailConfirmationToken, login } from '../actions';

const ConfirmEmail = ({ confirmEmailStatusCode, userLogged }) => {
  
  switch (confirmEmailStatusCode) {
    case 1: 
      return (
        <div>
          We emailed You a registration link, please follow it
        </div>
      );
    case 2:
      return (
        <div>
          Confirmation token expired, click 
          &nbsp; &nbsp;
          <Button 
            onClick={() => {
              if (!userLogged) {
                const token = Router.pathname.split('/').slice(-1)[0];
                resendEmailConfirmationToken.request(token);
              }
            }} 
            variant="outlined" 
            color="primary"
          >
            here
          </Button>
          &nbsp; &nbsp;
          to resend again
        </div>
      );
    case 3: 
      return (
        <div>
          Account confirmation done successfully,  
          <Link href="/account">
            <a>go to Your account</a>
          </Link>
        </div>
      );
    default: 
      return (
        <Error statusCode={404} />
      );
  }
};

ConfirmEmail.getInitialProps = async ctx => {

  if (!ctx.isServer) {
    console.log('LOGGING CTX FROM CLIENT', ctx);
  }

  const { res, isServer, store } = ctx;

  const { confirmEmailStatusCode, userLogged } = isServer ? res.customData : store.getState().app; 
  login.success({ confirmEmailStatusCode, userLogged });

  return { confirmEmailStatusCode, userLogged };

};

export default ConfirmEmail;
