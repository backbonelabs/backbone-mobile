import React from 'react';

const { PropTypes } = React;

const propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object),
  ]),
};

const defaultProps = {
  style: {},
};

export default { propTypes, defaultProps };
