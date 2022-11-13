import reactCookie from 'react-cookies';

export function getPageStorage(type) {
  const sessionId = `${reactCookie.load('sessionId')}-${window.__Conf__.product}main`;
  let pageRecordJsonStr = localStorage.getItem(sessionId);
  if (pageRecordJsonStr === 'null' || !pageRecordJsonStr) pageRecordJsonStr = '{}';
  const pageRecord = JSON.parse(pageRecordJsonStr);
  return pageRecord ? pageRecord[type] || {} : {};
}

export function setPageStorage(type, data) {
  const sessionId = `${reactCookie.load('sessionId')}-${window.__Conf__.product}main`;
  let pageRecordJsonStr = localStorage.getItem(sessionId);
  if (pageRecordJsonStr === 'null' || !pageRecordJsonStr) pageRecordJsonStr = '{}';
  let pageRecord = JSON.parse(pageRecordJsonStr);
  let Record;
  if (pageRecord && pageRecord[type]) {
    Record = pageRecord[type] || {};
  } else {
    pageRecord[type] = {};
  }
  Record = data;
  pageRecord[type] = Record;
  localStorage.setItem(sessionId, JSON.stringify(pageRecord));
}

export function removePageStorage(type) {
  const sessionId = `${reactCookie.load('sessionId')}-${window.__Conf__.product}main`;
  const pageRecord = JSON.parse(localStorage.getItem(sessionId) || '{}');
  if (pageRecord) pageRecord[type] = {};
}

export function setCurrentPage(url) {
  localStorage.setItem('prevUrl', JSON.stringify({ url }))
}
export function getCurrentPage() {
  return JSON.parse(localStorage.getItem('prevUrl') || '{}')
}
