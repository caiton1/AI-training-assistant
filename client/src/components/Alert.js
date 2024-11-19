// Alert.js
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export function Alert({ variant, children }) {
  const alertStyles = classNames(
    'p-4 rounded-md border',
    {
      'bg-red-50 border-red-500 text-red-700': variant === 'destructive',
      'bg-green-50 border-green-500 text-green-700': variant === 'success',
    }
  );

  return <div className={alertStyles}>{children}</div>;
}

Alert.propTypes = {
  variant: PropTypes.oneOf(['destructive', 'success']),
  children: PropTypes.node.isRequired,
};

export function AlertDescription({ children }) {
  return <div className="text-sm">{children}</div>;
}

AlertDescription.propTypes = {
  children: PropTypes.node.isRequired,
};

Alert.AlertDescription = AlertDescription;
export default Alert;
