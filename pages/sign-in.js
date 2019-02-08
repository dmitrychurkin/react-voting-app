import { Grid, Typography, withStyles } from '@material-ui/core';
import Link from 'next/link';
import { withRouter } from 'next/router';
import SigninForm from '../components/SigninForm';

const styles = () => ({
  containerWidth: {
    width: `${50}%`
  }
});

const SignIn = ({ classes, router, csrf }) => {
  
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
          className={classes.containerWidth}
        >
          <Typography 
            variant="h4" 
            gutterBottom
            align="center"
          >
            Sign In
          </Typography>
          <SigninForm csrf={csrf} onSuccess={() => router.push('/confirm-email')} />
          <Typography variant="h5" gutterBottom>
            Have an account? 
          </Typography>
          <Link as='/login' href='/login'>
            <a>Login</a> 
          </Link>
        </Grid>
      </Grid>
    </div>
  );
};

SignIn.getInitialProps = (ctx, temp) => {
  console.log('temp => ', temp);
  return { csrf: ctx.csrf };
};

export default withRouter(withStyles(styles)(SignIn));