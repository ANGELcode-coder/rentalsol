// Uniform response envelope: { success, data, message?, meta? }
export function ok(res, data, meta) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(200).json(body);
}

export function created(res, data) {
  return res.status(201).json({ success: true, data });
}

export function noContent(res) {
  return res.status(204).json({ success: true });
}

export function message(res, msg, status = 200) {
  return res.status(status).json({ success: true, message: msg });
}

export function paginationMeta({ page, limit, total }) {
  const pages = limit > 0 ? Math.ceil(total / limit) : 1;
  return { page, limit, total, pages };
}

export function extractPagination(query, defaults = { page: 1, limit: 20 }) {
  const page = Math.max(1, parseInt(query.page, 10) || defaults.page);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaults.limit));
  return { page, limit, skip: (page - 1) * limit };
}