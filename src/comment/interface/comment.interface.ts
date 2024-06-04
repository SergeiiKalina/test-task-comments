export interface ICreateComment {
  text: string;

  userName: string;

  email: string;

  parent: number | null;

  homePage: string;

  file: any;
}
