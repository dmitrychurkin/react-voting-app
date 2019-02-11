import { connect } from 'react-redux'
import SigninForm from '../components/SigninForm';

export default connect(
  state => ({ initialValues: { _csrf: state.app.csrf } })
)(SigninForm);
