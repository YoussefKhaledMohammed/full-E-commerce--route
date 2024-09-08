export class ApiFeature {
    constructor(mongooseQuery, queryData) {  // queryData is req.query
        this.mongooseQuery = mongooseQuery;
        this.queryData = queryData;
    }

    pagination() {
        let { page, size } = this.queryData;
        ////////// pagination
        if (!page | page <= 0) {
            page = 1
        }
        page && (page = parseInt(page));
        if (!size | size <= 0) {
            size = 3
        }
        size && (size = parseInt(size));
        const skip = (page - 1) * size
        //////////pagination
        this.mongooseQuery = this.mongooseQuery.skip(skip).limit(size);
        return this;
    }

    sort() {
        let { sort } = this.queryData
        //////////sort
        sort && (sort = sort.replaceAll(",", ' '))
        // console.log(sort);
        //////////sort

        this.mongooseQuery = this.mongooseQuery.sort(sort);
        return this;
    }

    select() {
        let { select } = this.queryData
        //////////select
        select && (select = select.replaceAll(",", ' '))
        // console.log(select);
        //////////select
        this.mongooseQuery = this.mongooseQuery.select(select);
        return this;
    }

    filter() {
        let { page, size, sort, select, ...filter } = this.queryData
        //////////filter
        filter = JSON.parse(JSON.stringify(filter).replace(/gt|gte|lt|lte/g, (match) => `$${match}`))  // g to apply regex for all (global0) 
        // console.log(filter);
        //////////filter
        this.mongooseQuery = this.mongooseQuery.find(filter);
        return this;
    }
}