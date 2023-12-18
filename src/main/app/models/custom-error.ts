export default class CustomError extends Error {
  constructor(...params: any) {
    super(...params);
  }
}
