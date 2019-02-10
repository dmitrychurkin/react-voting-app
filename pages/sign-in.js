import { Grid, Typography, withStyles } from '@material-ui/core';
import Link from 'next/link';
import SigninContainer from '../containers/SigninContainer';

const styles = () => ({
  containerWidth: {
    width: `${50}%`
  }
});

const SignIn = ({ classes, router }) => {
  
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
          <SigninContainer />
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