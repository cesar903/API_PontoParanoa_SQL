import React from "react";
import styled from "styled-components";

const ContainerSelect = styled.div`
  width: 100%;
  padding: 1rem;
  background-color: var(--DwBoldGray);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  select {
    padding: 10px 15px;
    font-size: 1rem;
    border-radius: 2px;
    border: none;
    outline: none;
    background: var(--DwYellow);
    color: #333;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s ease-in-out;
  }

  option:hover{
        background-color: var(--DwBoldGray);
    
  }
`;

export default function SelectClass({ value, onChange, options, placeholder }) {
    return (
        <ContainerSelect>
            <select
                value={value}
                onChange={onChange}
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                        {opt.nome}
                    </option>
                ))}
            </select>
        </ContainerSelect>
    );
};

