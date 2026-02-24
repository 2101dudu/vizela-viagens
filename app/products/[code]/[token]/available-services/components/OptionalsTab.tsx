import React, { useMemo } from 'react';
import { DynOptional, OptionalServiceSelection } from '../types';
import OptionalServiceCard from './OptionalServiceCard';
import {
  groupOptionalsByType,
  getOptionalTypeLabel,
  getOptionalTypeIcon
} from '../utils/optionalsHelpers';

interface OptionalsTabProps {
  optionals: DynOptional[];
  selectedOptionals: { [optionalCode: string]: OptionalServiceSelection };
  onOptionalSelection: (optionalCode: string, selection: OptionalServiceSelection | null) => void;
  flightData: any;
  paxCounts: { adults: number; children: number[] };
  loading: boolean;
}

const OptionalsTab = React.memo<OptionalsTabProps>(({
  optionals,
  selectedOptionals,
  onOptionalSelection,
  flightData,
  paxCounts,
  loading
}) => {
  // Group optionals by type for organized display
  const groupedOptionals = useMemo(() => {
    return groupOptionalsByType(optionals);
  }, [optionals]);

  // Define the order of service types for consistent display
  const typeOrder = ['TRF', 'EXC', 'ACT', 'TOUR', 'OTHER'];

  // Sort types according to defined order
  const sortedTypes = useMemo(() => {
    const types = Object.keys(groupedOptionals);
    return types.sort((a, b) => {
      const aIndex = typeOrder.indexOf(a);
      const bIndex = typeOrder.indexOf(b);
      const aOrder = aIndex === -1 ? 999 : aIndex;
      const bOrder = bIndex === -1 ? 999 : bIndex;
      return aOrder - bOrder;
    });
  }, [groupedOptionals]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">A carregar serviços opcionais...</p>
        </div>
      </div>
    );
  }

  if (optionals.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Não há serviços opcionais disponíveis
        </h3>
        <p className="text-gray-600">
          Este pacote não inclui serviços opcionais adicionais.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🎯 Serviços Opcionais
        </h2>
        <p className="text-gray-600">
          Adicione serviços extra à sua viagem para uma experiência mais completa.
          Serviços marcados como "Obrigatório" já foram incluídos automaticamente.
        </p>
      </div>

      {/* Display grouped optionals */}
      <div className="space-y-8">
        {sortedTypes.map(type => {
          const servicesInType = groupedOptionals[type];
          const typeLabel = getOptionalTypeLabel(type);
          const typeIcon = getOptionalTypeIcon(type);

          return (
            <div key={type} className="space-y-4">
              {/* Type Header */}
              <div className="flex items-center gap-3 pb-2 border-b-2 border-gray-200">
                <span className="text-3xl">{typeIcon}</span>
                <h3 className="text-xl font-semibold text-gray-800">{typeLabel}</h3>
                <span className="text-sm text-gray-500">
                  ({servicesInType.length} {servicesInType.length === 1 ? 'serviço' : 'serviços'})
                </span>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 gap-4">
                {servicesInType.map(optional => {
                  const optionalCode = optional.Code || '';
                  const selection = selectedOptionals[optionalCode];
                  const isSelected = !!selection;

                  return (
                    <OptionalServiceCard
                      key={optionalCode}
                      optional={optional}
                      isSelected={isSelected}
                      selection={selection}
                      onSelect={(sel) => onOptionalSelection(optionalCode, sel)}
                      flightData={flightData}
                      paxCounts={paxCounts}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      {Object.keys(selectedOptionals).length > 0 && (
        <div className="mt-8 bg-purple-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 mb-3">
            📝 Resumo dos Serviços Selecionados
          </h4>
          <div className="space-y-2">
            {Object.values(selectedOptionals).map((selection, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{getOptionalTypeIcon(selection.optional.Type)}</span>
                  <span className="font-medium">{selection.optional.Name}</span>
                </div>
                <button
                  onClick={() => onOptionalSelection(selection.optional.Code || '', null)}
                  className="text-red-600 hover:text-red-700 text-xs font-medium"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

OptionalsTab.displayName = 'OptionalsTab';

export default OptionalsTab;
