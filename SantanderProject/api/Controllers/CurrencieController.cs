using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Data;
using api.Dtos.Rate;
using api.Interfaces;
using api.Mappers;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [Route("api/Rate")]
    [ApiController]
    public class CurrencieController : ControllerBase
    {
        private readonly ApplicationDBContex  _apiclient;
        private readonly IRateRepository _rateRepo;
        private readonly INBPClient _nbpClient;

        public CurrencieController(
            ApplicationDBContex  apiclient, 
            IRateRepository rateRepo,
            INBPClient nbpClient)
        {
            _rateRepo=rateRepo;
            _apiclient= apiclient;
            _nbpClient = nbpClient;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var rates = await _rateRepo.GetAllAsync();
            var rateDtos = rates.Select(r => r.ToRateDto());
            return Ok(rateDtos);
        }     
        [HttpGet("{code}")]
            public async Task<IActionResult> GetByCode([FromRoute] string code)
            {
                var rate =await _rateRepo.GetByCodeAsync(code);

                if(rate == null)
                {
                    return NotFound();
                }
                return Ok(rate.ToRateDto());
            }
        [HttpPost]
         public async Task<IActionResult> Create([FromBody] CreateCurencieReaquestDto RateDto)
        {
             var currencieModel = RateDto.ToRateFromCreateDTO();
            await _rateRepo.CreateAsync(currencieModel);
             return CreatedAtAction(nameof(GetByCode), new {code = currencieModel.Code}, currencieModel.ToRateDto());

        }
        [HttpPut]
        [Route("{code}")]
        public  async Task<IActionResult> Update([FromRoute] string code, [FromBody] UpdateCurencieReaquestDto  updateDto)
        {
            var currencieModel =await _rateRepo.UpdateAsync(code,updateDto);

            if(currencieModel==null)
            {
                 return NotFound();
            }


            return Ok(currencieModel.ToRateDto());

        }
        [HttpDelete]
        [Route("{code}")]
        public async Task<IActionResult> Delete([FromRoute] string code)
        {
             var currencieModel=await _rateRepo.DeleteAsync(code);

             if(currencieModel ==null)
             {
               return NotFound();
             }

             return NoContent();
              
        }

        [HttpPost("update-from-nbp")]
        public async Task<IActionResult> UpdateFromNBP()
        {
            try
            {
                var responseItems = await _nbpClient.GetExchangeRatesAsync();
                await _rateRepo.UpdateRatesFromNBPAsync(responseItems);
                return Ok(new { message = "Rates updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Failed to update rates: {ex.Message}" });
            }
        }
    }
}