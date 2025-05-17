// Path: components/date-input.tsx

"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface DateInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function DateInput({
  id,
  value,
  onChange,
  className = "",
  placeholder = "",
}: DateInputProps) {
  // Estado para armazenar o valor formatado para exibição (dd/mm/yyyy)
  const [displayValue, setDisplayValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  // Converter de yyyy-mm-dd para dd/mm/yyyy para exibição
  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split("-");
      setDisplayValue(`${day}/${month}/${year}`);
    } else {
      setDisplayValue("");
    }
  }, [value]);

  // Restaurar a posição do cursor após a renderização
  useEffect(() => {
    if (cursorPosition !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      setCursorPosition(null);
    }
  }, [displayValue, cursorPosition]);

  // Lidar com a mudança do input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const currentCursorPosition = e.target.selectionStart || 0;

    // Verificar se o usuário está deletando um caractere '/'
    if (
      inputValue.length < displayValue.length &&
      (displayValue[currentCursorPosition] === "/" ||
        displayValue[currentCursorPosition - 1] === "/")
    ) {
      // Se estiver deletando uma barra, remover também o dígito anterior
      const newValue =
        displayValue.substring(0, currentCursorPosition - 1) +
        displayValue.substring(currentCursorPosition + 1);

      setDisplayValue(newValue);
      // Ajustar a posição do cursor
      setCursorPosition(currentCursorPosition - 1);

      // Converter para formato yyyy-mm-dd se tiver o formato completo
      if (newValue.length === 8) {
        const parts = newValue.split("/");
        if (parts.length === 3) {
          const [day, month, year] = parts;
          onChange(`${year}-${month}-${day}`);
        }
      }
      return;
    }

    // Permitir apenas números e barras
    const cleanValue = inputValue.replace(/[^\d/]/g, "");

    // Limitar o comprimento
    if (cleanValue.length <= 10) {
      let formattedValue = cleanValue;
      let newCursorPosition = currentCursorPosition;

      // Adicionar barras automaticamente
      if (
        cleanValue.length === 2 &&
        !cleanValue.includes("/") &&
        currentCursorPosition === 2
      ) {
        formattedValue = `${cleanValue}/`;
        newCursorPosition += 1;
      } else if (
        cleanValue.length === 5 &&
        cleanValue.indexOf("/", 3) === -1 &&
        currentCursorPosition === 5
      ) {
        formattedValue = `${cleanValue}/`;
        newCursorPosition += 1;
      }

      setDisplayValue(formattedValue);
      setCursorPosition(newCursorPosition);

      // Converter para formato yyyy-mm-dd para o valor interno
      if (formattedValue.length === 10) {
        const [day, month, year] = formattedValue.split("/");
        // Verificar se a data é válida
        if (
          day &&
          month &&
          year &&
          !isNaN(Number(day)) &&
          !isNaN(Number(month)) &&
          !isNaN(Number(year))
        ) {
          onChange(`${year}-${month}-${day}`);
        }
      } else if (formattedValue.length < 10) {
        // Se o usuário estiver editando/apagando, limpar o valor interno
        onChange("");
      }
    }
  };

  // Lidar com o foco no input
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Selecionar todo o texto ao focar
    e.target.select();
  };

  // Lidar com a perda de foco
  const handleBlur = () => {
    // Validar e formatar a data quando o usuário sai do campo
    if (displayValue) {
      // Verificar se está no formato correto
      const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = displayValue.match(datePattern);

      if (match) {
        const [, day, month, year] = match;
        // Verificar se é uma data válida
        const date = new Date(`${year}-${month}-${day}`);
        if (!isNaN(date.getTime())) {
          onChange(`${year}-${month}-${day}`);
        } else {
          // Data inválida, limpar o campo
          setDisplayValue("");
          onChange("");
        }
      } else {
        // Formato inválido, limpar o campo
        setDisplayValue("");
        onChange("");
      }
    }
  };

  // Lidar com teclas especiais
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const cursorPos = inputRef.current?.selectionStart || 0;

      // Se o cursor estiver logo após uma barra, mover o cursor para antes da barra
      if (displayValue[cursorPos - 1] === "/" && cursorPos > 0) {
        e.preventDefault();
        setCursorPosition(cursorPos - 1);

        // Remover a barra e o dígito anterior
        const newValue =
          displayValue.substring(0, cursorPos - 2) +
          displayValue.substring(cursorPos);

        setDisplayValue(newValue);
      }
    }
  };

  return (
    <Input
      id={id}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder || "dd/mm/aaaa"}
      className={className}
      maxLength={10}
      ref={inputRef}
      inputMode="numeric"
    />
  );
}
