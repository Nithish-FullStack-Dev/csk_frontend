export interface Permission {
  _id: string;
  name: string;
  description: string;
  color: string;
  permissions: Per[];
}

export interface Per {
  module: string;
  submodule: string;
  actions: {
    read: Boolean;
    write: Boolean;
    edit: Boolean;
    delete: Boolean;
    view_only: Boolean;
  };
}
