import { Grid, Typography, withStyles } from '@material-ui/core';
import Link from 'next/link';
import LoginContainer from '../containers/LoginContainer';


const styles = () => ({
  containerWidth: {
    width: `${50}%`
  }
});

const Login = props => {
  console.log('Login page props', props);
  return (
    <div>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        wrap='nowrap'
      >
        <Grid 
          item
          className={props.classes.containerWidth}
        >
          <Typography 
            variant="h4" 
            gutterBottom
            align="center"
          >
            <span className="foo">Login</span>
          </Typography>
          <LoginContainer />
          <Link as='/forgot' href='/forgot'>
            <a>Forgot password</a>
          </Link>
          <span> or </span>
          <Link as='/sign-in' href='/sign-in'>
            <a>Create account</a>
          </Link>
        </Grid>
      </Grid>
      <style jsx>{`
        .foo {
          color: red;
        }
      `}</style>
    </div>
  );
};


Login.getInitialProps = async (...args) => {
  console.log('Login.getInitialProps => ', args)
};

export default withStyles(styles)(Login);
