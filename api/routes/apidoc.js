/**
 * @apiDefine Authorization
 * @apiHeader {String} Authorization Token returned at login/signup
 */

 /**
  * @apiDefine Error
  * @apiErrorExample {json} Error:
  *     HTTP/2 400 or 500 Error Code
  *     {
  *       "message": "Error message here"
  *     }
  */

 /**
  * @apiDefine Paging
  * @apiParam {Number} [pageSize = 20] Number of objects to get back (min 1, max 20)
  * @apiParam {String} [sort = "desc"] Ascending (asc) or descending (desc) sort order
  * @apiParam {String} [sortKey = "dateCreated"] Object property to sort by
  * @apiParam {Number} [pageNumber = 0] Page number (number of objects to skip in sorted query)
  */