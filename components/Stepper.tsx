import React from 'react';
import { CheckCircleIcon } from './icons/IconDefs';

interface StepperProps {
    currentStep: number;
    totalSteps: number;
    steps: string[];
}

const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps, steps }) => {
    return (
        <div className="w-full px-4 sm:px-0">
            <div className="flex items-start">
                {steps.map((stepName, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isCurrent = currentStep === stepNumber;

                    return (
                        <React.Fragment key={stepName}>
                            {/* Step */}
                            <div className="flex flex-col items-center relative text-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                                        isCompleted ? 'bg-cyan-400' : isCurrent ? 'border-2 border-cyan-400 bg-gray-900' : 'border-2 border-gray-700 bg-gray-900'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircleIcon className="w-6 h-6 text-black" />
                                    ) : isCurrent ? (
                                        <span className="h-3 w-3 bg-cyan-400 rounded-full animate-pulse" />
                                    ) : (
                                        <span className="text-gray-500 font-bold">{stepNumber}</span>
                                    )}
                                </div>
                                <p className={`mt-3 text-xs font-medium w-16 sm:w-24 break-words ${isCurrent || isCompleted ? 'text-white' : 'text-gray-500'}`}>
                                    {stepName}
                                </p>
                            </div>

                            {/* Connector */}
                            {index < totalSteps - 1 && (
                                <div className={`flex-1 h-0.5 mt-5 transition-colors duration-300 ${isCompleted ? 'bg-cyan-400' : 'bg-gray-700'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default Stepper;