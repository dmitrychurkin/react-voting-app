import { Grid, Typography, withStyles } from '@material-ui/core';
import Link from 'next/link';
import SigninForm from '../components/SigninForm';

const styles = () => ({
  containerWidth: {
    width: `${50}%`
  }
});

const SignIn = props => {
  
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
            Sign In
          </Typography>
          <SigninForm />
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

export default withStyles(styles)(SignIn);