'use strict';

/**
 * Response helper — standarisasi format JSON response seluruh API.
 *
 * Format sukses:
 *   { success: true,  message, data, meta }
 *
 * Format error:
 *   { success: false, message, errors }
 */

const success = (res, data = null, message = 'OK', statusCode = 200, meta = null) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
};

const created = (res, data = null, message = 'Created successfully') =>
  success(res, data, message, 201);

const error = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const badRequest  = (res, message = 'Bad request',     errors = null) => error(res, message, 400, errors);
const unauthorized = (res, message = 'Unauthorized')                   => error(res, message, 401);
const forbidden   = (res, message = 'Forbidden')                       => error(res, message, 403);
const notFound    = (res, message = 'Resource not found')              => error(res, message, 404);
const unprocessable = (res, message = 'Validation failed', errors = null) => error(res, message, 422, errors);
const serverError = (res, message = 'Internal server error')           => error(res, message, 500);

const paginated = (res, rows, count, page, limit, message = 'OK') =>
  success(res, rows, message, 200, {
    totalItems:  count,
    totalPages:  Math.ceil(count / limit),
    currentPage: page,
    pageSize:    limit,
  });

module.exports = { success, created, error, badRequest, unauthorized, forbidden, notFound, unprocessable, serverError, paginated };
