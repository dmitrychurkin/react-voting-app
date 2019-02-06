import { reduxForm, Field } from 'redux-form';
import { TextField, Button, FormControlLabel, Checkbox } from '@material-ui/core';
import { login } from '../actions';

const validate = values => {

  const errors = {};

  const requiredFields = [
    'email', 'password'
  ];

  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = 'This field required';
    }
  });

  if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
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

const renderCheckbox = ({ label }) => (
  <div>
    <FormControlLabel
      control={<Checkbox />}
      label={label}
    />
  </div>
)

const MaterialLoginForm = props => {
  const { handleSubmit, pristine, submitting, error, valid } = props;
  
  const submit = handleSubmit(login);
  return (
    <form onSubmit={submit}>
      <div>
        <Field 
          style={{ width: `${100}%` }}
          type="email"
          name="email"
          component={renderTextField}
          label="Email"
        />
      </div>
      <div>
        <Field 
            style={{ width: `${100}%` }}
            type="password"
            name="password"
            component={renderTextField}
            label="Password"
          />
      </div>
      <div>
        <Field name="remember_me" component={renderCheckbox} label="Keep me signed" />
      </div>
      {error && <strong>{error}</strong>}
      <div>
        <Button type="submit" variant="contained" color="primary" disabled={pristine || submitting || !valid}>
          Login
        </Button>
      </div>
    </form>
  );
};

export default reduxForm({
  form: 'loginUIForm',
  validate
})(MaterialLoginForm);