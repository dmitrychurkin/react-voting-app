import LoginForm from '../components/LoginForm';


const Login = props => (
  <LoginForm />
);

Login.getInitialProps = async (...args) => {
  console.log(args)
};

export default Login;