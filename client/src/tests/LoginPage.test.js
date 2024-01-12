import React, { useContext } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../pages/LoginPage';
import { UserContext } from "../UserContext";
// Set up a mock for the useContext hook
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}));

test('successfully logs in with valid credentials', async () => {
  // Mock the setUser function from useContext
  const mockSetUser = useContext(UserContext);
  React.useContext.mockReturnValue({ setUser: mockSetUser });

  // Render the component
  render(<LoginPage />);
});
