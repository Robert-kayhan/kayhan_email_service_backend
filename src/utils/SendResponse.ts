const sendError = (res :any, statusCode:number, message:any) => {
    res.status(statusCode).json({
      success: false,
      error: message || "Something went wrong",
    });
  };
  
  export default sendError;
  