// Interface using index signature
export interface APIProps {
  username: string;
  password: string;
  [prop: string]: string;
}

export class APIData {
  constructor(private data: APIProps) {}
  get(propName: string):string {
    return this.data[propName];
  }

  set(update:APIProps):void {
    Object.assign(this.data, update);
  }
}

const dataAdmin:APIProps = {
  username: 'admin',
  password: '1234',
  id_ws: 'hola',
  id_gp: 'nona'
};

const data1 = new APIData(dataAdmin);
// eslint-disable-next-line no-console
console.log(data1.get('id_ws'));
// eslint-disable-next-line no-console
console.log(data1.get('password'));
