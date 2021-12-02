export type ResponseError<V = void> = {
  code: number;
  appCode: number;
  message: {
    text: string;
    validation?: V;
  }
}

export interface IResponse<D = null, E = void> {
  success: boolean;
  error: ResponseError<E>;
  data: D;
}
