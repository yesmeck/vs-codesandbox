export interface SimpleSandbox {
  updated_at: string;
  title: string;
  inserted_at: string;
  id: string;
}

export interface Directory {
  updated_at: Date;
  title: string;
  source_id: string;
  shortid: string | null;
  inserted_at: Date;
  id: string;
  directory_shortid: string;
}

export interface Module {
  updated_at: Date;
  title: string;
  source_id: string;
  shortid: string;
  is_binary: boolean;
  inserted_at: Date;
  id: string;
  directory_shortid: string | null;
  code: string;
}

export interface Sandbox {
  updated_at: Date;
  directories: Directory[];
  is_frozen: boolean;
  title: string;
  privacy: number;
  id: string;
  modules: Module[];
  source_id: string;
  screenshot_url: string;
  user_liked: boolean;
  entry: string;
}
