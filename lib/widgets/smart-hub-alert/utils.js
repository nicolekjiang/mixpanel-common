import moment from 'moment';
import {extend} from '../../util';

/* eslint-disable camelcase */
function propertyToSegFilter(property) {
  const PROPERTY_TYPE_MAP = {
    'STRING': `string`,
    'NUMBER': `number`,
    'DATE': `datetime`,
    'BOOLEAN': `boolean`,
    'LIST': `list`,
  };

  const PROPERTY_SOURCE_MAP = {
    'EVENTS': `properties`,
    'PEOPLE': `user`,
  };

  return {
    dropdown_tab_index: 0,
    property: {
      name: property.name,
      source: PROPERTY_SOURCE_MAP[property.source],
      type: PROPERTY_TYPE_MAP[property.type],
    },
    selected_property_type: PROPERTY_TYPE_MAP[property.type],
    type: PROPERTY_TYPE_MAP[property.typecast || property.type],
  };
}
/* eslint-enable camelcase */

function propertyFilterToSegFilter(propertyFilter) {
  const STRING_FILTER_OPERATOR_MAP = {
    'CONTAINS': `in`,
    'DOES_NOT_CONTAIN': `not in`,
    'EQUALS': `==`,
    'DOES_NOT_EQUAL': `!=`,
    'SET': `set`,
    'NOT_SET': `not set`,
  };

  const NUMBER_FILTER_OPERATOR_MAP = {
    'BETWEEN': `><`,
    'GREATER_THAN': `>`,
    'LESS_THAN': `<`,
    'EQUAL_TO': `==`,
  };

  const ABSOLUTE_DATE_FILTER_OPERATOR_MAP = {
    'ON': `==`,
    'BETWEEN': `><`,
  };

  const RELATIVE_DATE_FILTER_OPERATOR_MAP = {
    'LESS_THAN': `<`,
    'GREATER_THAN': `>`,
  };

  const TIME_UNIT_MAP = {
    'DAY': `days`,
    'WEEK': `weeks`,
    'MONTH': `months`,
  };

  const BOOLEAN_FILTER_OPERATOR_MAP = {
    'true': `true`,
    'false': `false`,
  };

  const LIST_FILTER_OPERATOR_MAP = {
    'CONTAINS': `in`,
  };

  let filter;
  if (propertyFilter.stringFilter) {
    const operator = propertyFilter.stringFilter.operator;
    const operands = propertyFilter.stringFilter.operands;
    let operand;
    if ([`EQUALS`, `DOES_NOT_EQUAL`].includes(operator)) {
      operand = operands;
    } else if ([`CONTAINS`, `DOES_NOT_CONTAIN`].includes(operator)) {
      operand = operands[0];
    } else {
      operand = ``;
    }
    filter = {
      operator: STRING_FILTER_OPERATOR_MAP[operator],
      operand,
    };
  } else if (propertyFilter.numberFilter) {
    const operator = propertyFilter.numberFilter.operator;
    const operand1 = propertyFilter.numberFilter.operand1;
    const operand2 = propertyFilter.numberFilter.operand2;
    filter = {
      operator: NUMBER_FILTER_OPERATOR_MAP[operator],
      operand: operator === `BETWEEN` ? [operand1.toString(), operand2.toString()] : operand1.toString(),
    };
  } else if (propertyFilter.absoluteDateFilter) {
    const operator = propertyFilter.absoluteDateFilter.operator;
    const operand1 = propertyFilter.absoluteDateFilter.operand1;
    const operand2 = propertyFilter.absoluteDateFilter.operand2;
    filter = {
      operator: ABSOLUTE_DATE_FILTER_OPERATOR_MAP[operator],
      operand: operator === `BETWEEN` ? [operand1, operand2] : operand1,
    };
  } else if (propertyFilter.relativeDateFilter) {
    const operator = propertyFilter.relativeDateFilter.operator;
    const operand = propertyFilter.relativeDateFilter.operand;
    const timeUnit = propertyFilter.relativeDateFilter.timeUnit;
    filter = {
      operator: RELATIVE_DATE_FILTER_OPERATOR_MAP[operator],
      operand,
      unit: TIME_UNIT_MAP[timeUnit],
    };
  } else if (propertyFilter.booleanFilter) {
    const operand = propertyFilter.booleanFilter.operand;
    filter = {
      operand: BOOLEAN_FILTER_OPERATOR_MAP[operand],
    };
  } else if (propertyFilter.listFilter) {
    const operator = propertyFilter.listFilter.operator;
    const operand = propertyFilter.listFilter.operand;
    filter = {
      operator: LIST_FILTER_OPERATOR_MAP[operator],
      operand,
    };
  }
  return extend(propertyToSegFilter(propertyFilter.property), {filter});
}

/* eslint-disable camelcase */
export function funnelsQueryToUrlParams(query) {
  const urlParams = {};

  // TODO(mack): Figure out how to handle timezones
  const currMoment = moment();
  urlParams.from_date = moment(query.dateRange.from).diff(currMoment, `days`);
  urlParams.to_date = moment(query.dateRange.to).diff(currMoment, `days`);

  const filters = query.propertyFilters.map(propertyFilterToSegFilter);

  if (query.groupByProperty) {
    const groupByProperty = query.groupByProperty;
    const propertySegFilter = propertyToSegFilter(groupByProperty);
    filters.push(propertySegFilter);
    urlParams.segment_type = propertySegFilter.property.type;
  } else {
    urlParams.segment_type = `unknown`;
  }

  urlParams.segfilter = {
    filters,
    op: `and`,
  };

  return urlParams;
}
/* eslint-enable camelcase */

/* eslint-disable camelcase */
export function retentionQueryToUrlParams(query) {
  const TIME_UNIT_MAP = {
    'DAY': `day`,
    'WEEK': `week`,
    'MONTH': `month`,
  };

  const SEGMENT_METHOD_MAP = {
    'FIRST': `single`,
    'ALL': `multiple`,
  };

  const RETENTION_TYPE_MAP = {
    'BIRTH': `birth`,
    'COMPOUNDED': `compounded`,
  };

  const urlParams = {};

  urlParams.event = query.event;
  urlParams.filters = query.propertyFilters.map(propertyFilterToSegFilter);

  if (query.segmentEvent) {
    urlParams.segmentation_event = query.segmentEvent;
    urlParams.segments = SEGMENT_METHOD_MAP[query.segmentMethod];
    urlParams.on = query.segmentOn;
  }

  urlParams.percentage_view = query.countType === `PERCENT`;

  urlParams.retention_type = RETENTION_TYPE_MAP[query.retentionType];
  if (query.bornEvent) {
    urlParams.born_event = query.bornEvent;
    urlParams.born_filters = query.bornPropertyFilters.map(propertyFilterToSegFilter);
  }

  // TODO(mack): Figure out how to handle timezones
  const currMoment = moment();
  urlParams.date_range = {
    from: moment(query.dateRange.from).diff(currMoment, `days`),
    to: moment(query.dateRange.to).diff(currMoment, `days`),
  };
  urlParams.date_unit = TIME_UNIT_MAP[query.timeUnit];

  return urlParams;
}
/* eslint-enable camelcase */

export function insightsQueryToUrlParams(query) {
  const PROPERTY_TYPE_MAP = {
    'STRING': `string`,
    'NUMBER': `number`,
    'DATE': `datetime`,
    'BOOLEAN': `boolean`,
    'LIST': `list`,
  };

  const MATH_ACTION_MAP = {
    'TOTAL': `total`,
    'UNIQUE': `unique`,
    'AVERAGE': `average`,
    'MEDIAN': `median`,
    'MIN': `min`,
    'MAX': `max`,
  };

  const TIME_UNIT_MAP = {
    'HOUR': `hour`,
    'DAY': `day`,
    'WEEK': `week`,
    'MONTH': `month`,
    'QUARTER': `quarter`,
  };

  const PROPERTY_SOURCE_MAP = {
    'EVENTS': `events`,
    'PEOPLE': `people`,
  };

  const PROPERTY_FILTERS_OPERATOR_MAP = {
    'AND': `all`,
    'OR': `any`,
  };

  const STRING_FILTER_OPERATOR_MAP = {
    'CONTAINS': `contains`,
    'DOES_NOT_CONTAIN': `does not contain`,
    'EQUALS': `equals`,
    'DOES_NOT_EQUAL': `does not equal`,
    'SET': `set`,
    'NOT_SET': `not set`,
  };

  const NUMBER_FILTER_OPERATOR_MAP = {
    'BETWEEN': `is between`,
    'GREATER_THAN': `is greater than`,
    'LESS_THAN': `is less than`,
    'EQUAL_TO': `is equal to`,
  };

  const ABSOLUTE_DATE_FILTER_OPERATOR_MAP = {
    'ON': `was on`,
    'BETWEEN': `was between`,
  };

  const RELATIVE_DATE_FILTER_OPERATOR_MAP = {
    'LESS_THAN': `was in the`,
    'GREATER_THAN': null, // from segmentation, but not supported in insights
  };

  const BOOLEAN_FILTER_OPERATOR_MAP = {
    'true': `is true`,
    'false': `is false`,
  };

  const LIST_FILTER_OPERATOR_MAP = {
    'CONTAINS': `contains`,
    'DOES_NOT_CONTAIN': `does not contain`,
  };

  const showClauses = query.showClauses.map(showClause => {
    if (showClause.showEvent) {
      const showEvent = showClause.showEvent;
      return {
        math: MATH_ACTION_MAP[showEvent.action],
        resourceType: `all`,
        value: {
          name: showEvent.event,
        },
      };
    } else if (showClause.showEventProperty) {
      const showEventProperty = showClause.showEventProperty;
      const property = showEventProperty.property;
      return {
        math: MATH_ACTION_MAP[showEventProperty.action],
        resourceType: `all`,
        property: {
          name: property.name,
          resourceType: PROPERTY_SOURCE_MAP[property.source],
          type: PROPERTY_TYPE_MAP[property.type],
        },
        value: {
          name: showEventProperty.event,
        },
      };
    } else if (showClause.showPeopleProperty) {
      const showPeopleProperty = showClause.showPeopleProperty;
      const property = showPeopleProperty.property;
      return {
        math: MATH_ACTION_MAP[showPeopleProperty.action],
        resourceType: `people`,
        property: {
          name: property.name,
          resourceType: PROPERTY_SOURCE_MAP[property.source],
          type: PROPERTY_TYPE_MAP[property.type],
        },
      };
    }
  });

  const groupClauses = query.groupByProperties.map(groupByProperty => {
    const property = groupByProperty.property;
    const groupClause = {
      propertyType: PROPERTY_TYPE_MAP[property.type],
      typeCast: property.typecast ? PROPERTY_TYPE_MAP[property.typecast] : null,
      resourceType: PROPERTY_SOURCE_MAP[property.source],
      value: property.name,
    };
    if (groupByProperty.timeUnit) {
      groupClause.unit = TIME_UNIT_MAP[groupByProperty.timeUnit];
    }
    return groupClause;
  });

  const filterClauses = query.propertyFilters.map(propertyFilter => {
    let filterClause = {};
    if (propertyFilter.stringFilter) {
      const operator = propertyFilter.stringFilter.operator;
      const operands = propertyFilter.stringFilter.operands;
      let filterValue;
      if ([`EQUALS`, `DOES_NOT_EQUAL`].includes(operator)) {
        filterValue = operands;
      } else if ([`CONTAINS`, `DOES_NOT_CONTAIN`].includes(operator)) {
        filterValue = operands[0];
      } else {
        filterValue = null;
      }
      filterClause = extend(filterClause, {
        filterOperator: STRING_FILTER_OPERATOR_MAP[operator],
        filterValue,
      });
    } else if (propertyFilter.numberFilter) {
      const operator = propertyFilter.numberFilter.operator;
      const operand1 = propertyFilter.numberFilter.operand1;
      const operand2 = propertyFilter.numberFilter.operand2;
      filterClause = extend(filterClause, {
        filterOperator: NUMBER_FILTER_OPERATOR_MAP[operator],
        filterValue: operator === `BETWEEN` ? [operand1, operand2] : operand1,
      });
    } else if (propertyFilter.absoluteDateFilter) {
      const operator = propertyFilter.absoluteDateFilter.operator;
      const operand1 = propertyFilter.absoluteDateFilter.operand1;
      const operand2 = propertyFilter.absoluteDateFilter.operand2;
      filterClause = extend(filterClause, {
        filterOperator: ABSOLUTE_DATE_FILTER_OPERATOR_MAP[operator],
        filterValue: operator === `BETWEEN` ? [operand1, operand2] : operand1,
      });
    } else if (propertyFilter.relativeDateFilter) {
      const operator = propertyFilter.relativeDateFilter.operator;
      const operand = propertyFilter.relativeDateFilter.operand;
      const timeUnit = propertyFilter.relativeDateFilter.timeUnit;
      filterClause = extend(filterClause, {
        filterOperator: RELATIVE_DATE_FILTER_OPERATOR_MAP[operator],
        filterValue: operand,
        filterDateUnit: TIME_UNIT_MAP[timeUnit],
      });
    } else if (propertyFilter.booleanFilter) {
      const operand = propertyFilter.booleanFilter.operand;
      filterClause = extend(filterClause, {
        filterOperator: BOOLEAN_FILTER_OPERATOR_MAP[operand],
      });
    } else if (propertyFilter.listFilter) {
      const operator = propertyFilter.listFilter.operator;
      const operand = propertyFilter.listFilter.operand;
      filterClause = extend(filterClause, {
        filterOperator: LIST_FILTER_OPERATOR_MAP[operator],
        filterValue: operand,
      });
    }

    const property = propertyFilter.property;
    filterClause = extend(filterClause, {
      value: property.name,
      filterType: PROPERTY_TYPE_MAP[property.type],
      resourceType: PROPERTY_SOURCE_MAP[property.source],
    });

    return filterClause;
  });

  const filterSection = {clauses: filterClauses};
  if (query.propertyFiltersOperator) {
    filterSection.determiner = PROPERTY_FILTERS_OPERATOR_MAP[query.propertyFiltersOperator];
  }

  const timeClauses = [{
    unit: TIME_UNIT_MAP[query.timeUnit],
    value: [
      query.dateRange.from,
      query.dateRange.to,
    ],
  }];

  return {
    displayOptions: {
      analysis: `linear`,
      chartType: `line`,
      plotStyle: `standard`,
      value: `absolute`,
    },
    sections: {
      show: {clauses: showClauses},
      group: {clauses: groupClauses},
      filter: filterSection,
      time: {clauses: timeClauses},
    },
  };
}
