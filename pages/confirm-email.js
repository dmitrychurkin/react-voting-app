import Link from 'next/link';
import Error from 'next/error'
import Button from '@material-ui/core/Button';

const ConfirmEmail = props => {
  console.log('ConfirmEmail props => ', props);
  switch (props.confirmationCode) {
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
          <Button variant="outlined" color="primary">
            here
          </Button>
          to resend again
        </div>
      );
    case 3: 
      return (
        <div>
          Account confirmation done successfully,  
          <Link href="account">
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

  const confirmationCode =  isServer ? res.customData.confirmEmailStatusCode : store.getState().app.emailConfirmationState;
  
  return { confirmationCode };

};

export default ConfirmEmail;
