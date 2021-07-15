import React from 'react';

import { StyledNavigator } from '../Styled/Navigation';

export default function Menu({ children }) {
	return <StyledNavigator>{children}</StyledNavigator>;
}