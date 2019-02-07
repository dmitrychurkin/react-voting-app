import { reduxForm, Field } from 'redux-form';
import { TextField, Button } from '@material-ui/core';
import { signIn } from '../actions';


const validate = values => {

  const errors = {};

  const requiredFields = [
    'firstName',
    'email',
    'password',
    'confirmPassword'
  ];

  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = 'This field required';
    }
  });

  const minLengthErrorMessage = 'Name must have atleast 3 characters';
  const maxLengthErrorMessage = 'Name must have maximum 100 characters';

  if (values.firstName && values.firstName.length < 3) {
    errors.firstName = minLengthErrorMessage;
  }

  if (values.firstName && values.firstName.length > 100) {
    errors.firstName = maxLengthErrorMessage;
  }

  if (values.lastName && values.lastName.length > 100) {
    errors.lastName = maxLengthErrorMessage;
  }

  if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  if (values.email && values.email.length > 100) {
    errors.email = 'Email must contain atmost 100 characters length';
  }

  if (values.password && (values.password.length < 8 || values.password.length > 100)) {
    errors.password = 'Password must be between 8-100 characters long';
  }

  if (values.password !== values.confirmPassword) {
    errors.password = 'Passwords should match';
  }

  return errors;

};

const renderTextField = ({ label, type, input, meta: { touched, invalid, error }, ...custom }) => (
  <TextField 
    type={type}
    label={label}
    placeholder={label}
    error={touched && invalid}
    helperText={touched && error}
    {...input}
    {...custom}
  />
);


const MaterialSignInForm = props => {
  const { handleSubmit, pristine, submitting, error, valid } = props;
  
  const submit = handleSubmit(signIn);
  return (
    <form onSubmit={submit}>
      <div>
        <Field 
            style={{ width: `${100}%` }}
            required
            type="text"
            name="firstName"
            component={renderTextField}
            label="First name"
          />
      </div>
      <div>
        <Field 
            style={{ width: `${100}%` }}
            type="text"
            name="lastName"
            component={renderTextField}
            label="Last name"
          />
      </div>
      <div>
        <Field 
          style={{ width: `${100}%` }}
          required
          type="email"
          name="email"
          component={renderTextField}
          label="Email"
        />
      </div>
      <div>
        <Field 
            style={{ width: `${100}%` }}
            required
            type="password"
            name="password"
            component={renderTextField}
            label="Password"
          />
      </div>
      <div>
        <Field 
            style={{ width: `${100}%` }}
            required
            type="password"
            name="confirmPassword"
            component={renderTextField}
            label="Confirm password"
          />
      </div>
      {error && <strong>{error}</strong>}
      <div>
        <Button type="submit" variant="contained" color="primary" disabled={pristine || submitting || !valid}>
          Signin
        </Button>
      </div>
    </form>
  );
};

export default reduxForm({
  form: 'signinUIForm',
  validate
})(MaterialSignInForm);