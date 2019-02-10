import { connect } from 'react-redux'
import LoginForm from '../components/LoginForm';

export default connect(
  state => ({ initialValues: { _csrf: state.app.csrf } })
)(LoginForm);