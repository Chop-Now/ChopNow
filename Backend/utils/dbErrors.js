/**
 * Turns database errors that are really the user's input problem (a phone number
 * already on another account, a value that fails validation) into a clear
 * status + message, instead of a 500 that exposes a raw MongoDB error string.
 *
 * @returns {{status: number, message: string} | null} null when the error is
 *   something else and should be handled as a real server error.
 */
function friendlyDbError(error) {
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
    if (field === 'email') {
      return { status: 409, message: 'An account with this email already exists' };
    }
    if (field === 'phone') {
      return { status: 409, message: 'That phone number is already registered to another account' };
    }
    return { status: 409, message: 'That value is already in use' };
  }
  if (error?.name === 'ValidationError') {
    const first = Object.values(error.errors || {})[0];
    return { status: 400, message: first?.message || 'Some of the details are not valid' };
  }
  return null;
}

module.exports = { friendlyDbError };
