import { Grid, Typography, withStyles } from '@material-ui/core';
import Link from 'next/link';
import LoginContainer from '../containers/LoginContainer';


const styles = () => ({
  containerWidth: {
    width: `${50}%`
  }
});

const Login = ({ query, classes }) => {
  
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
            <span className="foo">Login</span>
          </Typography>
          <LoginContainer query={query} />
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


Login.getInitialProps = async ctx => {
  return { query: ctx.query };
};

export default withStyles(styles)(Login);
