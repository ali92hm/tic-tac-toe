
exports.echo = async (method, query, body) => {
  let result = {
    message: `Recieved ${method}`,
    queryString: query,
    body: body
  }
  console.log(result)

  return result
}
