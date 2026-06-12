// Generate a unique ID
export function generateId(): string {
  return crypto.randomUUID();
}

// Parse JSON body
export async function parseBody<T>(request: Request): Promise<T> {
  return await request.json() as T;
}

// Build success response
export function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Build error response
export function error(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Extract slug from title
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u4e00-\u9fa5]/g, (char) => {
      const pinyinMap: Record<string, string> = {
        '我': 'wo', '你': 'ni', '他': 'ta', '是': 'shi', '的': 'de',
        '在': 'zai', '有': 'you', '和': 'he', '了': 'le', '一': 'yi',
        '个': 'ge', '人': 'ren', '们': 'men', '来': 'lai', '到': 'dao',
        '这': 'zhe', '里': 'li', '看': 'kan', '见': 'jian', '好': 'hao',
        '用': 'yong', '会': 'hui', '可': 'ke', '以': 'yi', '学': 'xue',
        '习': 'xi', '开': 'kai', '发': 'fa', '程': 'cheng', '序': 'xu',
        '设': 'she', '计': 'ji', '技': 'ji', '术': 'shu', '网': 'wang',
        '站': 'zhan', '博': 'bo', '客': 'ke', '文': 'wen', '章': 'zhang',
        '日': 'ri', '常': 'chang', '生': 'sheng', '活': 'huo', '爱': 'ai',
        '中': 'zhong', '心': 'xin', '理': 'li', '想': 'xiang', '梦': 'meng',
        '时': 'shi', '间': 'jian', '分': 'fen', '享': 'xiang', '知': 'zhi',
        '识': 'shi', '今': 'jin', '天': 'tian', '美': 'mei', '丽': 'li',
        '大': 'da', '小': 'xiao', '新': 'xin', '旧': 'jiu', '快': 'kuai',
        '慢': 'man', '高': 'gao', '低': 'di', '长': 'chang', '短': 'duan',
        '出': 'chu', '入': 'ru', '前': 'qian', '后': 'hou', '左': 'zuo',
        '右': 'you', '上': 'shang', '下': 'xia', '白': 'bai', '黑': 'hei',
        '红': 'hong', '绿': 'lv', '蓝': 'lan', '黄': 'huang', '紫': 'zi',
        '年': 'nian', '月': 'yue', '周': 'zhou',
      };
      return pinyinMap[char] || char;
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Parse query parameters
export function getQueryParams(url: URL): Record<string, string> {
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}