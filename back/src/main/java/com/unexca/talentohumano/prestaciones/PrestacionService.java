package com.unexca.talentohumano.prestaciones;

import org.springframework.stereotype.Service;
import java.time.Period;
import java.util.List;

@Service
public class PrestacionService {

    public double calcularPrestacionesSociales(DatosLiquidacionRequest datos) {
        
        Period periodoLaborado = Period.between(datos.fechaIngreso(), datos.fechaEgreso());
        int anos = periodoLaborado.getYears();
        int meses = periodoLaborado.getMonths();
        int dias = periodoLaborado.getDays();
        
        int totalMesesCompletos = (anos * 12) + meses;
        
        double salarioNormalMensual;
        if (Boolean.TRUE.equals(datos.esSalarioVariable())) {
            salarioNormalMensual = datos.promedioSueldoUltimos6Meses();
        } else {
            salarioNormalMensual = datos.sueldoTabla() + datos.primas();
        }

        double salarioNormalDiario = salarioNormalMensual / 30.0;
        double alicuotaVacacional = (salarioNormalDiario * datos.diasBonoVacacional()) / 360.0;
        double alicuotaAguinaldos = (salarioNormalDiario * datos.diasAguinaldos()) / 360.0;
        
        double salarioIntegralDiario = salarioNormalDiario + alicuotaVacacional + alicuotaAguinaldos;

        double montoBasePrestaciones = 0.0;

        if (anos == 0 && totalMesesCompletos < 3) {
            int mesesAPagar = totalMesesCompletos + (dias > 0 ? 1 : 0);
            montoBasePrestaciones = (mesesAPagar * 5) * salarioIntegralDiario;
            
        } else {
            long anosServicio = anos;
            if (meses > 6 || (meses == 6 && dias > 0)) {
                anosServicio++; 
            }
            
            double retroactivo = (anosServicio * 30) * salarioIntegralDiario;
            montoBasePrestaciones = Math.max(datos.historicoAcumulado(), retroactivo);
        }

        String motivo = datos.motivoTerminacion() != null ? datos.motivoTerminacion().toUpperCase() : "";
        List<String> motivosIndemnizacionDoble = List.of(
            "DESPIDO INJUSTIFICADO", 
            "RETIRO JUSTIFICADO", 
            "CAUSAS AJENAS"
        );

        if (motivosIndemnizacionDoble.contains(motivo)) {
            montoBasePrestaciones *= 2; 
        }

        double netoAPagar = montoBasePrestaciones - (datos.anticipos() != null ? datos.anticipos() : 0.0);

        if (datos.otrasDeudas() != null && datos.otrasDeudas() > 0) {
            double limiteDescuentoDeudas = netoAPagar * 0.50; 
            double descuentoPermitido = Math.min(datos.otrasDeudas(), limiteDescuentoDeudas);
            netoAPagar -= descuentoPermitido;
        }

        if (datos.pensionAlimentaria() != null && datos.pensionAlimentaria() > 0) {
            netoAPagar -= datos.pensionAlimentaria();
        }

        return netoAPagar;
    }

}
