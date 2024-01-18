
exports.successResponse = (
    message,
    body,
    res
  ) => {
    return res.status(200).json({
      status: 200,
      message: message,
      data: body,
    });
  };
  
  exports.createSuccessResponse = (
    message,
    body,
    res
  ) => {
    return res.status(201).json({
      status: 201,
      message: message,
      data: body,
    });
  };
  
  exports.unauthorizedResponse = (
    message,
    res
  ) => {
    return res.status(201).json({
      status: 401,
      message: message
    });
  };
  
  exports.errorResponse = (message, res) => {
    return res.status(400).json({
      status: 400,
      message: message,
    });
  };
  
  exports.notFoundResponse = (
    field,
    value,
    entity,
    res
  ) => {
    return res.status(404).json({
      status: 404,
      message: entity + ' with ' + field + ' of [' + value + '] not found',
    });
  };
  
  exports.serverErrorResponse = (ex, res) => {
      res.status(500).json({
        status: 500,
        message: 'Server Error',
        description: ex.message
      });
  };
  