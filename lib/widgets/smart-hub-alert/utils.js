import {extend} from '../../util';

export function mapFunnelsQueryToUrlParams() {
  return {};
}

const Insights = {};

Insights.MATH_ACTION_MAP = {
  'TOTAL': `total`,
  'UNIQUE': `unique`,
  'AVERAGE': `average`,
  'MEDIAN': `median`,
  'MIN': `min`,
  'MAX': `max`,
};

Insights.TIME_UNIT_MAP = {
  'HOUR': `hour`,
  'DAY': `day`,
  'WEEK': `week`,
  'MONTH': `month`,
  'QUARTER': `quarter`,
};

Insights.PROPERTY_SOURCE_MAP = {
  'EVENTS': `events`,
  'PEOPLE': `people`,
};

Insights.PROPERTY_TYPE_MAP = {
  'STRING': `string`,
  'NUMBER': `number`,
  'DATE': `datetime`,
  'BOOLEAN': `boolean`,
  'LIST': `list`,
};

Insights.PROPERTY_FILTERS_OPERATOR_MAP = {
  'AND': `all`,
  'OR': `any`,
};

Insights.STRING_FILTER_OPERATOR_MAP = {
  'CONTAINS': `contains`,
  'DOES_NOT_CONTAIN': `does not contain`,
  'EQUALS': `equals`,
  'DOES_NOT_EQUAL': `does not equal`,
  'SET': `set`,
  'NOT_SET': `not set`,
};

Insights.NUMBER_FILTER_OPERATOR_MAP = {
  'BETWEEN': `is between`,
  'GREATER_THAN': `is greater than`,
  'LESS_THAN': `is less than`,
  'EQUAL_TO': `is equal to`,
};

Insights.ABSOLUTE_DATE_FILTER_OPERATOR_MAP = {
  'ON': `was on`,
  'BETWEEN': `was between`,
};

Insights.RELATIVE_DATE_FILTER_OPERATOR_MAP = {
  'LESS_THAN': `was in the`,
  'GREATER_THAN': null, // from segmentation, but not supported in insights
};

Insights.BOOLEAN_FILTER_OPERATOR_MAP = {
  'true': `is true`,
  'false': `is false`,
};

Insights.LIST_FILTER_OPERATOR_MAP = {
  'CONTAINS': `contains`,
  'DOES_NOT_CONTAIN': `does not contain`,
};

export function mapInsightsQueryToUrlParams(query) {
  const showClauses = query.showClauses.map(showClause => {
    if (showClause.showEvent) {
      const showEvent = showClause.showEvent;
      return {
        math: Insights.MATH_ACTION_MAP[showEvent.action],
        resourceType: `all`,
        value: {
          name: showEvent.event,
        },
      };
    } else if (showClause.showEventProperty) {
      const showEventProperty = showClause.showEventProperty;
      const property = showEventProperty.property;
      return {
        math: Insights.MATH_ACTION_MAP[showEventProperty.action],
        resourceType: `all`,
        property: {
          name: property.name,
          resourceType: Insights.PROPERTY_SOURCE_MAP[property.source],
          type: Insights.PROPERTY_TYPE_MAP[property.type],
        },
        value: {
          name: showEventProperty.event,
        },
      };
    } else if (showClause.showPeopleProperty) {
      const showPeopleProperty = showClause.showPeopleProperty;
      const property = showPeopleProperty.property;
      return {
        math: Insights.MATH_ACTION_MAP[showPeopleProperty.action],
        resourceType: `people`,
        property: {
          name: property.name,
          resourceType: Insights.PROPERTY_SOURCE_MAP[property.source],
          type: Insights.PROPERTY_TYPE_MAP[property.type],
        },
      };
    }
  });

  const groupClauses = query.groupByProperties.map(groupByProperty => {
    const property = groupByProperty.property;
    const groupClause = {
      propertyType: Insights.PROPERTY_TYPE_MAP[property.type],
      typeCast: property.typecast ? Insights.PROPERTY_TYPE_MAP[property.typecast] : null,
      resourceType: Insights.PROPERTY_SOURCE_MAP[property.source],
      value: property.name,
    };
    if (groupByProperty.timeUnit) {
      groupClause.unit = Insights.TIME_UNIT_MAP[groupByProperty.timeUnit];
    }
    return groupClause;
  });

  const filterClauses = query.propertyFilters.map(propertyFilter => {
    let filterClause = {};
    if (propertyFilter.stringFilter) {
      const operator = propertyFilter.stringFilter.operator;
      const operands = propertyFilter.stringFilter.operands;
      filterClause = extend(filterClause, {
        filterOperator: Insights.STRING_FILTER_OPERATOR_MAP[operator],
        filterValue: [`EQUALS`, `DOES_NOT_EQUAL`].includes(operator) ? operands : operands[0],
      });
    } else if (propertyFilter.numberFilter) {
      const operator = propertyFilter.numberFilter.operator;
      const operand1 = propertyFilter.numberFilter.operand1;
      const operand2 = propertyFilter.numberFilter.operand2;
      filterClause = extend(filterClause, {
        filterOperator: Insights.NUMBER_FILTER_OPERATOR_MAP[operator],
        filterValue: operator === `BETWEEN` ? [operand1, operand2] : operand1,
      });
    } else if (propertyFilter.absoluteDateFilter) {
      const operator = propertyFilter.absoluteDateFilter.operator;
      const operand1 = propertyFilter.absoluteDateFilter.operand1;
      const operand2 = propertyFilter.absoluteDateFilter.operand2;
      filterClause = extend(filterClause, {
        filterOperator: Insights.ABSOLUTE_DATE_FILTER_OPERATOR_MAP[operator],
        filterValue: operator === `BETWEEN` ? [operand1, operand2] : operand1,
      });
    } else if (propertyFilter.relativeDateFilter) {
      const operator = propertyFilter.relativeDateFilter.operator;
      const operand = propertyFilter.relativeDateFilter.operand;
      const timeUnit = propertyFilter.relativeDateFilter.timeUnit;
      filterClause = extend(filterClause, {
        filterOperator: Insights.RELATIVE_DATE_FILTER_OPERATOR_MAP[operator],
        filterValue: operand,
        filterDateUnit: Insights.TIME_UNIT_MAP[timeUnit],
      });
    } else if (propertyFilter.booleanFilter) {
      const operand = propertyFilter.booleanFilter.operand;
      filterClause = extend(filterClause, {
        filterOperator: Insights.BOOLEAN_FILTER_OPERATOR_MAP[operand],
      });
    } else if (propertyFilter.listFilter) {
      const operator = propertyFilter.listFilter.operator;
      const operand = propertyFilter.listFilter.operand;
      filterClause = extend(filterClause, {
        filterOperator: Insights.LIST_FILTER_OPERATOR_MAP[operator],
        filterValue: operand,
      });
    }

    const property = propertyFilter.property;
    filterClause = extend(filterClause, {
      value: property.name,
      filterType: Insights.PROPERTY_TYPE_MAP[property.type],
      resourceType: Insights.PROPERTY_SOURCE_MAP[property.source],
    });

    return filterClause;
  });

  const filterSection = {clauses: filterClauses};
  if (query.propertyFiltersOperator) {
    filterSection.determiner = Insights.PROPERTY_FILTERS_OPERATOR_MAP[query.propertyFiltersOperator];
  }

  const timeClauses = [{
    unit: Insights.TIME_UNIT_MAP[query.timeUnit],
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

export function mapRetentionQueryToUrlParams() {
  return {};
}
