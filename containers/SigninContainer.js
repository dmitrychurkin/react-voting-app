import { connect } from 'react-redux'
import SigninForm from '../components/SigninForm';
import { emailConfiramtionState } from '../actions'

export default connect(
  state => ({ initialValues: { _csrf: state.app.csrf } }),
  { setEmailConfiramtionState: emailConfiramtionState }
)(SigninForm);
