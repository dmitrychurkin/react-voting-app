import { connect } from 'react-redux'
import AccountBody from '../components/AccountBody';
import { logout } from '../actions';

const mapDispatchToProps = dispatch => ({ logout: dispatch(logout.request) });

export default connect(
  state => state,
  mapDispatchToProps
)(AccountBody);