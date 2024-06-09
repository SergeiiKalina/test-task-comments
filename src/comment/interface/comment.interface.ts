export interface ICreateComment {
  text: string;

  parent: number | null;

  userName: string;

  homePage: string;
  authorId: number;
  email: string;

  file: any;
}
